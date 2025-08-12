const db = require('../models');
const StorageLog = db.StorageLog;
const { v4: uuidv4 } = require('uuid');
const getLocalIP = require('../helper/GetIP')
const dayjs = require('dayjs');

const ActivityLog = async ({ account, username, msgs }) => {
    const acc = account
    const user = username
    const ipAddress = getLocalIP()
    const timestamp = dayjs().toISOString()
    const msg = msgs

    const result = await StorageLog.create({
                id: uuidv4(),
                Username: `${acc} (${user})`,
                IPAddress: ipAddress,
                Activity: `${msg}`,
                Timestamp: timestamp
            });

    if (result) {
        return true
    } else {
        return false        
    }
}


module.exports = ActivityLog