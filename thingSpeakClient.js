import { https } from 'https'
import { q } from 'q';
import { DataSource } from './dataSource';

export class ThingSpeakClient extends DataSource {
    static URL = 'api.thingspeak.com';
    static ENTRY_LIFETIME = 900000;

    constructor(config) {
        const self = this;
        super();

        self._config = config;
    }

    getValue() {
        const self = this,
            deferred = q.defer(),
            options = {
                host: ThingSpeakclient.URL,
                path: '/channels/' + self._config.channel + '/feeds/last?' + self._config.readKey
            },
            request = https.request(options, result => {
                let str = '';
                
                response.on('data', chunk => { str += chunk; });
                response.on('end', () => { 
                    const entry = JSON.parse(str);

                    if (self._validEntry(entry)) {
                        deferred.resolve(entry[self._config.fieldId]);
                    } else {
                        deferred.reject(new Error("Last entry is too old."));
                    }
                });
            });

        request.on('error', error => { deferred.reject(error); });
        request.end();

        return deferred.promise;
    }

    _validEntry(entry) {
        return (abs((new Date()) - (new Date(entry.created_at))) < ThingSpeakClient.ENTRY_LIFETIME);
    }
}