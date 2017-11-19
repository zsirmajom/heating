import { fs } from 'fs';
import { push } from 'pushover-notifications';

const notificationConfig = JSON.parse(fs.readFileSync('notificationSettings.json', 'utf8'));

export function send(title, message) {
    const p = new push({
        user: notificationConfig.user,
        token: notificationConfig.token,
    }),
    msg = {
        message: message,
        title: title,
	    priority: 1
    }

    p.send(msg, (error, result) => {
        if (error) {
            throw error;
        }

        console.log(result);
    });
};
