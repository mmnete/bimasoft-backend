import { Request, Response } from 'express';
import { UserService } from '../../services/users/user.service';
import {
    loginUser,
    logoutUser,
    checkUserLoggedIn
  } from '../../utils/firebaseUtils';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(req: Request, res: Response) {
    try {
      const { firebaseUid, email, role, insuranceEntityId, entityType } = req.body;

      // Validate required fields
      if (!firebaseUid || !email || !role || !insuranceEntityId || !entityType) {
        res.status(400).json({ message: 'Firebase UID, email, role, insurance entity ID, and entity type are required' });
        return;
      }

      // Validate email format (basic check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Check if a user with the same email or Firebase UID already exists
      const existingUser = await this.userService.findByUniqueFields(email, firebaseUid);

      if (existingUser) {
        res.status(400).json({ message: 'A user with the same email or Firebase UID already exists' });
        return;
      }

      // If no duplicate exists, create the new user
      const user = await this.userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
      return;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const user = await this.userService.findOne(Number(req.params.id));
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByFirebaseUid(req: Request, res: Response) {
    try {
      const user = await this.userService.findByFirebaseUid(req.params.firebaseUid);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { email, firebaseUid } = req.body;

      // Validate required fields
      if (!email || !firebaseUid) {
        res.status(400).json({ message: 'Email and Firebase UID are required' });
        return;
      }

      // Validate email format (basic check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Check if a user with the same email or Firebase UID already exists (excluding the current user)
      const existingUser = await this.userService.findByUniqueFieldsExcludingId(
        email,
        firebaseUid,
        Number(req.params.id),
      );

      if (existingUser) {
        res.status(400).json({ message: 'A user with the same email or Firebase UID already exists' });
        return;
      }

      // If no duplicate exists, update the user
      const user = await this.userService.update(Number(req.params.id), req.body);
      res.status(200).json(user);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.userService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async search(req: Request, res: Response) {
    try {
      const users = await this.userService.search(req.query.query as string);
      res.status(200).json(users);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByRole(req: Request, res: Response) {
    try {
      const users = await this.userService.findByRole(req.params.role);
      res.status(200).json(users);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByInsuranceEntity(req: Request, res: Response) {
    try {
      const users = await this.userService.findByInsuranceEntity(
        Number(req.params.insuranceEntityId),
        req.params.entityType,
      );
      res.status(200).json(users);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  /**
   * Log in a user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      // Log in the user using Firebase
      const token = await loginUser(email, password);

      // Fetch the user from the database
      const user = await this.userService.findByEmail(email);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ token, user });
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
      return;
    }
  }

  /**
   * Log out a user
   */
  async logout(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      // Validate required fields
      if (!uid) {
        res.status(400).json({ message: 'User ID (uid) is required' });
        return;
      }

      // Log out the user using Firebase
      await logoutUser(uid);

      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

   /**
   * Check if a user is logged in
   */
   async checkLoggedIn(req: Request, res: Response) {
    try {
      const idToken = req.headers.authorization?.split('Bearer ')[1]; // Extract the token from the Authorization header

      // Validate the token
      if (!idToken) {
        res.status(401).json({ message: 'Authorization token is required' });
        return;
      }

      // Verify the token and get the Firebase UID
      const userRecord = await checkUserLoggedIn(idToken);

      if (!userRecord) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Fetch the user from the database
      const user = await this.userService.findByFirebaseUid(userRecord.uid);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User is logged in', user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  /**
   * Send a password reset email
   */
//   async forgotPassword(req: Request, res: Response) {
//     try {
//       const { email } = req.body;

//       // Validate required fields
//       if (!email) {
//         res.status(400).json({ message: 'Email is required' });
//         return;
//       }

//       // Send a password reset email using Firebase
//       const resetLink = await sendPasswordResetEmail(email);

//       // Optionally, log the reset link (for debugging purposes)
//       console.log('Password reset link:', resetLink);

//       res.status(200).json({ message: 'Password reset email sent successfully' });
//     } catch (error) {
//       if (error instanceof Error) {
//         res.status(500).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: 'An unknown error occurred' });
//       }
//     }
//   }
}