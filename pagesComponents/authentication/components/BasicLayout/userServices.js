import { BehaviorSubject } from 'rxjs';
import getConfig from 'next/config';
import Router from 'next/router';

import { fetchWrapper } from 'helpers';
import { useEffect } from 'react';

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/TokenAuth`;

export const userService = {
    user: userSubject.asObservable(),
    get userValue () { return userSubject.value },
    login
};

function login(userNameOrEmailAddress, password) {
    return fetchWrapper.post(`${baseUrl}/authenticate`, { userNameOrEmailAddress, password })
         .then(user => {
            // publish user to subscribers and store in local storage to stay logged in between page refreshes
            userSubject.next(user);
            console.log('usernya bos => '+userNameOrEmailAddress);
            return user;
        }); 
}