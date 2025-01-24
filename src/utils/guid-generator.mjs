function generateNumericGuid() {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString().slice(2,10);
    const guid = timestamp + randomPart;
    console.log(`GUID: ${guid}`);
    return guid
}

const _generateNumericGuid = generateNumericGuid;
export { _generateNumericGuid as generateNumericGuid };