"use strict";

import { http } from 'http'
import { q } from 'q';
import { DataSource } from './dataSource';


export class TemperatureSensor extends DataSource {
    
    constructor(url) {
        const self = this;
        
        self.url = url;
        self.lastValue = null;
    }

    getValue() {
        const self = this,
            options = {
                host: self.url,
                path: '/Temperature'
            },
            deferred = q.defer(),
            request = http.request(options, response => {
                let str = '';
        
                response.on('data', chunk => { str += chunk; });
                response.on('end', () => { deferred.resolve(parseFloat(str)); });
            });
     
        request.on('error', error => { deferred.reject(error); });
        request.end();
       
        return deferred.promise;
    }
}