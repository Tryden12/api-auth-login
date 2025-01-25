// Import bcrypt for encrypting user password
import bcrypt from 'bcryptjs';
import { generateNumericGuid } from '../utils/guid-generator.mjs';
import { buildResponse } from '../utils/util.mjs';

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.USER_TABLE;

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

async function getUser(username) {
    const params = {
        TableName: tableName,
        Key: { "username": {"S": username} }
    }
    try {
        const data = await ddbDocClient.send( new GetItemCommand(params))
        console.log(JSON.stringify(data));
        return data.Item.username.S ? true : false;
    } catch (error) {
        console.error('There is an error getting user: ', error);
    }
}

async function saveUser(user) {
    var params = {
        TableName: tableName,
        Item: { 
            uuid: user.id,
            username: user.username,
            password: user.password,
            email: user.email
        }
    };
    try {
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - user registered.", data);
        return true
    } catch (error) {
        console.error("Error saving user: ", error);
    }

}
