import { buildResponse } from '../utils/util.mjs'
import { generateToken } from '../service/auth/token.mjs';
import { getUser } from '../service/user/user-service.mjs';
import bcrypt from 'bcryptjs';

// Get the DynamoDB table name from environment variables
const tableName = process.env.USER_TABLE;

const { compare } = bcrypt;

/**
 * HTTP post method for user login.
 */
export const loginUserHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get username and password from the body of the request
    const body = JSON.parse(event.body);
    const username = body.username;
    const password = body.password;

    // Check required fields
    if(!event || !username || !password) {
        return buildResponse(401, {
            message: 'Username and password are required.'
        })
    }

    // Validate username
    const dynamoUser = await getUser(username.trim())
    if (!dynamoUser) {
        return buildResponse(403, { message: 'User does not exist'});
    }

    // Await is needed since compare() is async
    const passwordsMatch = await compare(password, dynamoUser.password.S);
    
    // Incorrect password throws 403 
    if (!passwordsMatch) {
        return buildResponse(403, { message: "password is incorrect!"});
    }
    
    // Prepare userInfo for jwt
    const userInfo = {
        username: dynamoUser.username.S,
        name: dynamoUser.fullName.S
    }

    // Successful login
    // Generate token & build 200 response
    const token = await generateToken(userInfo)
    const response = {
        username: dynamoUser.username.S,
        passwordsMatch: passwordsMatch,
        enteredPasssword: password,
        dynamoPassword: dynamoUser.password.S,
        token: token
    }
    return buildResponse(200, response);
};
