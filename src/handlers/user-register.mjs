import { getUser, saveUser } from '../service/user/user-service.mjs'
import { generateNumericGuid } from '../utils/guid-generator.mjs';
import { buildResponse } from '../utils/util.mjs';
import bcrypt from 'bcryptjs';

const { hash } = bcrypt;

/**
 * A HTTP post method to add one user to a DynamoDB table.
 */
export const registerUserHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get username and password from the body of the request
    const body = JSON.parse(event.body);
    const username = body.username;
    const password = body.password;
    const email = body.email;
    const fullName = body.fullName;

    // Check required fields
    if(!username || !password || !email || !fullName) {
        return buildResponse(401, {
            message: 'All fields are required',
            body: JSON.stringify(event)
        }) 
    }

    // Check if username already exists
    const usernameExists = await getUser(username);
    if(usernameExists) {
        return buildResponse(401, {
            message: 'Something is not working. Please try a different username.'
        })
    }

    // Generate a GUID 
    const guid = generateNumericGuid();
    
    // Generate a hashed password string
    const encryptedPW = await hash(body.password.trim(), 8);

    // Prepare User & save user to database
    const user = {
        id: guid,
        username: body.username,
        password: encryptedPW,
        email: body.email,
        fullName: body.fullName
    };
    const userSaved = await saveUser(user);

    if(userSaved) {
        return buildResponse(201, {
            message: "Registration successful. Proceed to login",
            username: user.username,
        })
    } else {
        return buildResponse(503, { message: 'Server Error. Please try again later.'});
    }

};
