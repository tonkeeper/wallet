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
import type { BlockRaw } from './BlockRaw';
import {
    BlockRawFromJSON,
    BlockRawFromJSONTyped,
    BlockRawToJSON,
} from './BlockRaw';
import type { GetBlockProofLiteServer200ResponseStepsInner } from './GetBlockProofLiteServer200ResponseStepsInner';
import {
    GetBlockProofLiteServer200ResponseStepsInnerFromJSON,
    GetBlockProofLiteServer200ResponseStepsInnerFromJSONTyped,
    GetBlockProofLiteServer200ResponseStepsInnerToJSON,
} from './GetBlockProofLiteServer200ResponseStepsInner';

/**
 * 
 * @export
 * @interface GetBlockProofLiteServer200Response
 */
export interface GetBlockProofLiteServer200Response {
    /**
     * 
     * @type {boolean}
     * @memberof GetBlockProofLiteServer200Response
     */
    complete: boolean;
    /**
     * 
     * @type {BlockRaw}
     * @memberof GetBlockProofLiteServer200Response
     */
    from: BlockRaw;
    /**
     * 
     * @type {BlockRaw}
     * @memberof GetBlockProofLiteServer200Response
     */
    to: BlockRaw;
    /**
     * 
     * @type {Array<GetBlockProofLiteServer200ResponseStepsInner>}
     * @memberof GetBlockProofLiteServer200Response
     */
    steps: Array<GetBlockProofLiteServer200ResponseStepsInner>;
}

/**
 * Check if a given object implements the GetBlockProofLiteServer200Response interface.
 */
export function instanceOfGetBlockProofLiteServer200Response(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "complete" in value;
    isInstance = isInstance && "from" in value;
    isInstance = isInstance && "to" in value;
    isInstance = isInstance && "steps" in value;

    return isInstance;
}

export function GetBlockProofLiteServer200ResponseFromJSON(json: any): GetBlockProofLiteServer200Response {
    return GetBlockProofLiteServer200ResponseFromJSONTyped(json, false);
}

export function GetBlockProofLiteServer200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetBlockProofLiteServer200Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'complete': json['complete'],
        'from': BlockRawFromJSON(json['from']),
        'to': BlockRawFromJSON(json['to']),
        'steps': ((json['steps'] as Array<any>).map(GetBlockProofLiteServer200ResponseStepsInnerFromJSON)),
    };
}

export function GetBlockProofLiteServer200ResponseToJSON(value?: GetBlockProofLiteServer200Response | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'complete': value.complete,
        'from': BlockRawToJSON(value.from),
        'to': BlockRawToJSON(value.to),
        'steps': ((value.steps as Array<any>).map(GetBlockProofLiteServer200ResponseStepsInnerToJSON)),
    };
}

