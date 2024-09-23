const mongoose = require('mongoose');

const User = require('../models/user');
const { updateEmail } = require('../services/userServices');

const db = require('../config/key').TestMongoURI;

beforeAll(async () => {
    // Connect to a test database
   await mongoose.connect(db)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => console.log(err));
});

afterAll(async () => {
    // Clean up and close the connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('updateEmail - Integration Test', () => {
    const userEmail = "harsh.shah@yopmail.com";

    beforeEach(async () => {
         // Create a test user
        const user = new User({
            username: "HarshShah",
            password: "Test@1234",
            email: "harsh.shah@yopmail.com",
            role: "CUSTOMER",
        })

        await user.save()
    });

    afterEach(async () => {
        // Clean up after each test
        await User.deleteMany({});
    });

    it('should return an error if email is not provided', async () => {
        const response = await updateEmail(userEmail, {});
        expect(response).toEqual({
            data: { message: 'Email is required' },
            statusCode: 400,
        });
    });

    it('should return an error for invalid email format', async () => {
        const invalidBody = { email: 'invalid-email' };
        const response = await updateEmail(userEmail, invalidBody);
        expect(response).toEqual({
            data: { message: 'Invalid email address format' },
            statusCode: 400,
        });
    });

    it('should return an error if the email is already in use', async () => {

        const existingEmail = { email: 'harsh.shah@yopmail.com' };
        const response = await updateEmail(userEmail, existingEmail);
        expect(response).toEqual({
            data: { message: 'Email already in use' },
            statusCode: 400,
        });
    });

    it('should return an error if the user is not found', async () => {
        const updatedEmail = { email: "harsh2.shah@yopmail.com" };
        const notExistUser = "harsh2.shah@yopmail.com"
        const response = await updateEmail(notExistUser, updatedEmail);
        expect(response).toEqual({
            data: { message: 'User not found' },
            statusCode: 404,
        });
    });

    it('should update the email if all validations pass', async () => {
        const updatedEmail = { email: 'new-email@example.com' };

        const response = await updateEmail(userEmail, updatedEmail);
        expect(response.data.user.email).toEqual(updatedEmail.email);

    });

});
