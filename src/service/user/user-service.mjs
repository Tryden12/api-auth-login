// Create a DocumentClient for querying
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.USER_TABLE;


export async function getUser(username) {
    const params = {
        TableName: tableName,
        Key: {
            "username": { S: username } // Using the key format DynamoDB expects
        }
    };

    try {
        // Create and send the GetItemCommand
        const command = new GetItemCommand(params);
        const response = await ddbDocClient.send(command);

        if (response.Item) {
            console.log("Item retrieved:", response.Item);
            return response.Item
        } else {
            console.log("User not found");
            return null;
        }
    } catch (error) {
        console.error('There is an error getting user:', error);
        throw error;  // Optionally rethrow the error to handle it further up the stack
    }
}

export async function saveUser(user) {
    var params = {
        TableName: tableName,
        Item: { 
            uuid: user.id,
            username: user.username,
            password: user.password,
            email: user.email,
            fullName: user.fullName
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

export async function checkUsernameExists(username) {
    const params = {
        TableName: tableName,
        Key: {
            "username": { S: username } // Using the key format DynamoDB expects
        }
    };

    try {
        // Create and send the GetItemCommand
        const command = new GetItemCommand(params);
        const response = await ddbDocClient.send(command);

        if (response.Item) {
            const username = response.Item.username.S
            console.log(`Username ${username} already exists`);
            return true;
        } else {
            console.log("Username not found");
            return false;
        }
    } catch (error) {
        console.error('There is an error getting user:', error);
        throw error;  // Optionally rethrow the error to handle it further up the stack
    }
}

