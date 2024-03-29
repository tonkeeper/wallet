/* tslint:disable */
/* eslint-disable */
/**
 * REST api to TON blockchain explorer
 * Provide access to indexed TON blockchain
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: support@tonkeeper.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface EncryptedComment
 */
export interface EncryptedComment {
    /**
     * 
     * @type {string}
     * @memberof EncryptedComment
     */
    encryptionType: string;
    /**
     * 
     * @type {string}
     * @memberof EncryptedComment
     */
    cipherText: string;
}

/**
 * Check if a given object implements the EncryptedComment interface.
 */
export function instanceOfEncryptedComment(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "encryptionType" in value;
    isInstance = isInstance && "cipherText" in value;

    return isInstance;
}

export function EncryptedCommentFromJSON(json: any): EncryptedComment {
    return EncryptedCommentFromJSONTyped(json, false);
}

export function EncryptedCommentFromJSONTyped(json: any, ignoreDiscriminator: boolean): EncryptedComment {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'encryptionType': json['encryption_type'],
        'cipherText': json['cipher_text'],
    };
}

export function EncryptedCommentToJSON(value?: EncryptedComment | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'encryption_type': value.encryptionType,
        'cipher_text': value.cipherText,
    };
}

