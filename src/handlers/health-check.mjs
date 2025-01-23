import { buildResponse } from '../utils/util.mjs';


/**
 * HTTP GET method for health check.
 */
export const healthCheckHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accepts GET method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    const healthPath = '/health';

    if (event.httpMethod === 'GET' && event.path === healthPath) {
        return buildResponse(200);
    } else {
        return buildResponse(500);
    }

}