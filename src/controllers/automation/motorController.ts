import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { MotorDetails, MotorResponse, VehicleType, vehicleIcons } from '../../utils/types';

// Load environment variables from .env file
dotenv.config();

// NHTSA API base URL
const NHTSA_API_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Function to fetch motor details from NHTSA API
async function fetchMotorDetails(name: string): Promise<MotorDetails[]> {
  const response = await axios.get(
    `${NHTSA_API_URL}/GetModelsForMake/${name}?format=json`
  );

  if (!response.data.Results || response.data.Results.length === 0) {
    throw new Error('No motor details found');
  }

  // Limit to the first 10 results
  const first10Results = response.data.Results.slice(0, 10);

  // Map the first 10 results to MotorDetails
  return first10Results.map((motor: any) => ({
    make: motor.Make_Name,
    model: motor.Model_Name,
    vehicleType: motor.VehicleTypeName || 'Unknown',
  }));
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