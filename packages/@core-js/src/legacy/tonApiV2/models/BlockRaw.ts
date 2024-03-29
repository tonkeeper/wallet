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
 * @interface BlockRaw
 */
export interface BlockRaw {
    /**
     * 
     * @type {number}
     * @memberof BlockRaw
     */
    workchain: number;
    /**
     * 
     * @type {number}
     * @memberof BlockRaw
     */
    shard: number;
    /**
     * 
     * @type {number}
     * @memberof BlockRaw
     */
    seqno: number;
    /**
     * 
     * @type {string}
     * @memberof BlockRaw
     */
    rootHash: string;
    /**
     * 
     * @type {string}
     * @memberof BlockRaw
     */
    fileHash: string;
}

/**
 * Check if a given object implements the BlockRaw interface.
 */
export function instanceOfBlockRaw(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "workchain" in value;
    isInstance = isInstance && "shard" in value;
    isInstance = isInstance && "seqno" in value;
    isInstance = isInstance && "rootHash" in value;
    isInstance = isInstance && "fileHash" in value;

    return isInstance;
}

export function BlockRawFromJSON(json: any): BlockRaw {
    return BlockRawFromJSONTyped(json, false);
}

export function BlockRawFromJSONTyped(json: any, ignoreDiscriminator: boolean): BlockRaw {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'workchain': json['workchain'],
        'shard': json['shard'],
        'seqno': json['seqno'],
        'rootHash': json['root_hash'],
        'fileHash': json['file_hash'],
    };
}

export function BlockRawToJSON(value?: BlockRaw | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'workchain': value.workchain,
        'shard': value.shard,
        'seqno': value.seqno,
        'root_hash': value.rootHash,
        'file_hash': value.fileHash,
    };
}

