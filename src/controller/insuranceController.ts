import axios from 'axios';
import { Request, Response } from 'express';
import * as xml2js from 'xml2js';

export const verifyVehicleInsurance = async (req: Request, res: Response) => {
  try {
    const { registrationNumber } = req.body;

    // Make a POST request to the insurance verification endpoint
    const response = await axios.post('https://tiramis.tira.go.tz/covernote/api/public/portal/verify', {
        paramType: 2,
        searchParam: 'T878DGD'
      });

    // Convert the XML response to JSON
    xml2js.parseString(response.data, { trim: true, explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error parsing XML response',
        });
      }

      // Handle successful response and return the parsed JSON
      const jsonResponse = result.Response;  // The root of the XML response is "Response"
      
      if (jsonResponse && jsonResponse.error === "false") {
        res.status(200).json({
          success: true,
          message: 'Vehicle insurance verified successfully',
          data: jsonResponse.data,
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          message: 'Vehicle is not insured or verification failed',
        });
        return;
      }
    });
  } catch (error) {
    console.error("Error verifying vehicle insurance:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the vehicle's insurance.",
    });
    return;
  }
};
