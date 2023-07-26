import { Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { ValidationException } from 'src/exceptions';
import { Helpers } from 'src/utils';

@Injectable()
export class ValidationPipe<T> implements PipeTransform {
    /**
     * Construct a validation pipe
     * @param _schema - `Joi` schema
     * @param _batchValidate - should validate multiple list items in the request body
     */
    constructor(private _schema: ObjectSchema<T>, private _batchValidate = false) {}

    /**
     * Validate request body
     * @throws `ValidationException`
     */
    public transform(reqBody: unknown) {
        if (this._batchValidate) {
            if (!Array.isArray(reqBody)) {
                throw new ValidationException(undefined, undefined, true);
            }

            // if request body is empty but this is a batch validation,
            // throw an exception with no data so that the ValidationExceptionFilter will response correctly
            if (reqBody.length <= 0) {
                throw new ValidationException();
            }

            const errorList = this._validateMultiple(reqBody);
            if (Helpers.isFilledArray(errorList)) {
                throw new ValidationException(undefined, errorList);
            }
        } else {
            // if the request body is not an object, validate an empty object
            const body = typeof reqBody === 'object' && !Array.isArray(reqBody) && reqBody != null ? reqBody : {};
            const errors = this._validate(body);
            if (!Helpers.isEmptyObject(errors)) {
                throw new ValidationException(errors);
            }
        }

        return reqBody;
    }

    /**
     * Validate when the request body is an object array
     */
    private _validateMultiple(body: unknown[]) {
        const errorList: { [k: string]: string }[] = [];
        for (const item of body) {
            const errors = Helpers.validate(this._schema, item);
            if (!Helpers.isEmptyObject(errors)) {
                errorList.push(errors);
            }
        }
        return errorList;
    }

    /**
     * Validate when the request body is an object
     */
    private _validate(body: unknown) {
        return Helpers.validate(this._schema, body);
    }
}
