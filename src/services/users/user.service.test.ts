import { Pool } from "pg";
import { UserService } from "./user.service";

// Mock the pg module
jest.mock("pg", () => {
    const mockPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mockPool) };
});

describe("UserService", () => {
    let userService: UserService;
    let mockPool: jest.Mocked<Pool>;

    beforeEach(() => {
        // Create a new instance of the service and mock the pool
        userService = new UserService();
        mockPool = new Pool() as jest.Mocked<Pool>;
    });

    afterEach(() => {
        // Clear all mocks after each test
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create a new user", async () => {
            const mockUserData = {
                firebaseUid: "12345",
                fullName: "John Doe",
                email: "john.doe@example.com",
                phoneNumber: "+255123456789",
                role: "broker_agent",
                insuranceEntityId: 1,
                entityType: "insurance_broker",
                status: "active",
            };

            const mockResult = {
                rows: [{ id: 1, ...mockUserData }],
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.create(mockUserData);

            expect(mockPool.query).toHaveBeenCalledWith(
                `
      INSERT INTO users (
        firebase_uid, full_name, email, phone_number, role,
        insurance_entity_id, entity_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
                [
                    mockUserData.firebaseUid,
                    mockUserData.fullName,
                    mockUserData.email,
                    mockUserData.phoneNumber,
                    mockUserData.role,
                    mockUserData.insuranceEntityId,
                    mockUserData.entityType,
                    mockUserData.status,
                ]
            );

            expect(result).toEqual(mockResult.rows[0]);
        });
    });

    describe("findAll", () => {
        it("should return all users", async () => {
            const mockUsers = [
                { id: 1, fullName: "John Doe", email: "john.doe@example.com" },
                { id: 2, fullName: "Jane Doe", email: "jane.doe@example.com" },
            ];

            const mockResult = {
                rows: mockUsers,
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.findAll();

            expect(mockPool.query).toHaveBeenCalledWith("SELECT * FROM users;");
            expect(result).toEqual(mockUsers);
        });
    });

    describe("findOne", () => {
        it("should return a user by ID", async () => {
            const mockUser = {
                id: 1,
                fullName: "John Doe",
                email: "john.doe@example.com",
            };

            const mockResult = {
                rows: [mockUser],
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.findOne(1);

            expect(mockPool.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE id = $1;",
                [1]
            );
            expect(result).toEqual(mockUser);
        });

        it("should return undefined if user is not found", async () => {
            const mockResult = {
                rows: [],
            };

            // Mock the query method to return an empty result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.findOne(999);

            expect(mockPool.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE id = $1;",
                [999]
            );
            expect(result).toBeUndefined();
        });
    });

    describe("findByFirebaseUid", () => {
        it("should return a user by Firebase UID", async () => {
            const mockUser = { id: 1, firebaseUid: "12345", fullName: "John Doe" };

            const mockResult = {
                rows: [mockUser],
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.findByFirebaseUid("12345");

            expect(mockPool.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE firebase_uid = $1;",
                ["12345"]
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe("update", () => {
        it('should update a user', async () => {
            const mockUpdateData = { fullName: 'Jane Doe' };
            const mockUpdatedUser = { id: 1, full_name: 'Jane Doe', email: 'john.doe@example.com' };

            const mockResult = {
                rows: [mockUpdatedUser],
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.update(1, mockUpdateData);

            // Verify the query and parameters
            const [query, params] = (mockPool.query as jest.Mock).mock.calls[0];

            // Check if the query contains the expected SQL logic
            expect(query).toContain('UPDATE users');
            expect(query).toContain('SET full_name = $1');
            expect(query).toContain('WHERE id = $2');
            expect(query).toContain('RETURNING *');

            // Verify the parameters
            expect(params).toEqual(['Jane Doe', 1]);

            // Verify the result
            expect(result).toEqual(mockUpdatedUser);
        });

        it("should throw an error if no fields are provided", async () => {
            await expect(userService.update(1, {})).rejects.toThrow(
                "No fields to update"
            );
        });
    });

    describe("delete", () => {
        it("should delete a user by ID", async () => {
            // Mock the query method
            (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            await userService.delete(1);

            expect(mockPool.query).toHaveBeenCalledWith(
                "DELETE FROM users WHERE id = $1;",
                [1]
            );
        });
    });

    describe("search", () => {
        it("should search users by name, email, or phone number", async () => {
            const mockUsers = [
                { id: 1, fullName: "John Doe", email: "john.doe@example.com" },
                { id: 2, fullName: "Jane Doe", email: "jane.doe@example.com" },
            ];

            const mockResult = {
                rows: mockUsers,
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.search("Doe");

            expect(mockPool.query).toHaveBeenCalledWith(
                `
      SELECT * FROM users
      WHERE full_name ILIKE $1 OR email ILIKE $1 OR phone_number ILIKE $1;
    `,
                ["%Doe%"]
            );

            expect(result).toEqual(mockUsers);
        });
    });

    describe("findByRole", () => {
        it("should find users by role", async () => {
            const mockUsers = [
                { id: 1, fullName: "John Doe", role: "broker_agent" },
                { id: 2, fullName: "Jane Doe", role: "broker_agent" },
            ];

            const mockResult = {
                rows: mockUsers,
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.findByRole("broker_agent");

            expect(mockPool.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE role = $1;",
                ["broker_agent"]
            );
            expect(result).toEqual(mockUsers);
        });
    });

    describe("findByInsuranceEntity", () => {
        it("should find users by insurance entity ID and type", async () => {
            const mockUsers = [
                {
                    id: 1,
                    fullName: "John Doe",
                    insuranceEntityId: 1,
                    entityType: "insurance_broker",
                },
                {
                    id: 2,
                    fullName: "Jane Doe",
                    insuranceEntityId: 1,
                    entityType: "insurance_broker",
                },
            ];

            const mockResult = {
                rows: mockUsers,
            };

            // Mock the query method to return the mock result
            (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

            const result = await userService.findByInsuranceEntity(
                1,
                "insurance_broker"
            );

            expect(mockPool.query).toHaveBeenCalledWith(
                "SELECT * FROM users WHERE insurance_entity_id = $1 AND entity_type = $2;",
                [1, "insurance_broker"]
            );
            expect(result).toEqual(mockUsers);
        });
    });
});
