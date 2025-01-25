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

