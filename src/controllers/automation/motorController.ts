import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { MotorDetails, MotorResponse, VehicleType, vehicleIcons } from '../../utils/types';

// Load environment variables from .env file
dotenv.config();


const CAR_QUERY_API_URL = 'https://www.carqueryapi.com/api/0.3/';

async function fetchFromCarQuery(name: string): Promise<MotorDetails[]> {
  const response = await axios.get(`${CAR_QUERY_API_URL}?cmd=getModels&make=${name}`);
  if (!response.data.Models || response.data.Models.length === 0) {
    throw new Error('No motor details found in Car Query API');
  }
  return response.data.Models.slice(0, 10).map((model: any) => ({
    make: model.make_display,
    model: model.model_name,
    vehicleType: model.model_vehicle_type || 'Unknown',
  }));
}

const NHTSA_API_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

async function fetchFromNHTSA(name: string): Promise<MotorDetails[]> {
  try {
    const response = await axios.get(`${NHTSA_API_URL}/GetModelsForMake/${name}?format=json`);
    if (!response.data.Results || response.data.Results.length === 0) {
      throw new Error('No motor details found in NHTSA API');
    }
    return response.data.Results.slice(0, 10).map((motor: any) => ({
      make: motor.Make_Name,
      model: motor.Model_Name,
      vehicleType: motor.VehicleTypeName || 'Unknown',
    }));
  } catch (error) {
    console.error('Error fetching from NHTSA API:', error);
    return []; // Return an empty array if there's an error
  }
}

// Function to fetch motor details from NHTSA API
async function fetchMotorDetails(name: string): Promise<MotorDetails[]> {
  try {
    const results = await Promise.all([
      fetchFromNHTSA(name),
      fetchFromCarQuery(name)
    ]);

    // Combine results from all APIs
    const combinedResults = results.flat();

    // Remove duplicates based on make and model
    // Remove duplicates based on make and model using reduce
    const uniqueResults = combinedResults.reduce((acc, motor) => {
      const key = `${motor.make}-${motor.model}`;
      if (!acc.some((m) => `${m.make}-${m.model}` === key)) {
        acc.push(motor);
      }
      return acc;
    }, [] as MotorDetails[]);

    return uniqueResults.slice(0, 10); // Limit to the first 10 unique results
  } catch (error) {
    console.error('Error fetching motor details:', error);
    throw new Error('Failed to fetch motor details');
  }
}

// Function to determine the vehicle type based on the vehicleType string
function getVehicleType(vehicleType: string): VehicleType {
  if (vehicleType.includes('Car')) return 'Car';
  if (vehicleType.includes('Bike') || vehicleType.includes('Motorcycle')) return 'Bike';
  if (vehicleType.includes('Bus')) return 'Bus';
  if (vehicleType.includes('Truck')) return 'Truck';
  if (vehicleType.includes('Van')) return 'Van';
  return 'Unknown';
}

// Function to determine if the motor is a commercial vehicle
function determineIfCommercial(vehicleType: string): boolean {
  const commercialTypes = ['Truck', 'Bus', 'Van'];
  return commercialTypes.some((type) => vehicleType.includes(type));
}

// Controller function to handle the request
export const getMotorDetails = async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name) {
    res.status(400).json({ error: 'Name parameter is required' });
    return;
  }

  try {
    // Step 1: Fetch motor details from NHTSA API
    const motorDetailsList = await fetchMotorDetails(name as string);

    // Step 2: Map motor details to MotorResponse objects
    const motorResponses: MotorResponse[] = motorDetailsList.map((motorDetails) => {
      const vehicleType = getVehicleType(motorDetails.vehicleType);
      const isCommercial = determineIfCommercial(motorDetails.vehicleType);

      return {
        ...motorDetails,
        iconUrl: vehicleIcons[vehicleType], // Use predefined icon based on vehicle type
        isCommercial,
      };
    });

    // Step 3: Return the response
    res.json(motorResponses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch motor details' });
  }
};