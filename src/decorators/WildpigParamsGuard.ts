import { getBodyFromRequest, getQueryObjectFromRequest } from "../utils/server/request";

interface IFieldValidate {
    /** 是否必填 */
    required: boolean;
    /** 字段类型 */
    type?: "string" | "number" | "boolean" | "array";
    /** 最大长度，仅对string和array类型生效 */
    maxLength?: number;
    /** 最小长度，仅对string和array类型生效 */
    minLength?: number;
    /** 最大值，仅对number类型生效 */
    maxValue?: number;
    /** 最小值，仅对number类型生效 */
    minValue?: number;
    /** 自定义校验函数，返回true表示校验通过 */
    custom?: (value: any) => boolean | Promise<boolean>;
}

interface IParamsGuardOption {
    /** 校验params参数 */
    query?: Omit<Record<string, IFieldValidate>, "type" | "maxValue" | "minValue">;
    /** 校验body参数 */
    body?: Record<string, IFieldValidate>;
    /** 严格模式，开启后无定义的参数将被拒绝，default: true */
    strict?: boolean;
}


export const WildpigParamsGuard = (options: IParamsGuardOption) =>(target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req: Request, payload: any) {
        if(!payload)payload = {};
        if(options.strict === undefined)options.strict = true;
        // 获取query参数
        const query = getQueryObjectFromRequest(req);
        payload.query = query;
        // 获取body参数
        const body = await getBodyFromRequest(req);
        payload.body = body;

        // 如果严格模式开启，拒绝无定义的参数
        if(options.strict){
            const queryKeys = Object.keys(query);
            const bodyKeys = Object.keys(body);
            if(options.query){
                for(const key of queryKeys)
                    if(!(key in options.query))return new Response(`不接受的query参数：${key}`, { status: 400 });
            }
            if(options.body){
                for(const key of bodyKeys)
                    if(!(key in options.body))return new Response(`不接受的body参数：${key}`, { status: 400 });
            }
        }

        // 校验query参数
        if(options.query){
            for(const key of Object.keys(options.query)){
                const validate = options.query[key];
                if(!validate)continue;

                if(validate.required && !(key in query))return new Response(`query参数${key}必填`, { status: 400 });
                if(validate.maxLength && query[key].length > validate.maxLength)return new Response(`query参数${key}长度超过设定值：${validate.maxLength}`, { status: 400 });
                if(validate.minLength && query[key].length < validate.minLength)return new Response(`query参数${key}长度不足设定值：${validate.minLength}`, { status: 400 });
                if(validate.custom && !(await validate.custom(query[key])))return new Response(`query参数${key}自定义校验失败`, { status: 400 });
            }
        }

        // 校验body参数
        if(options.body){
            for(const key of Object.keys(options.body)){
                const validate = options.body[key];
                if(!validate)continue;

                if(validate.required && !(key in body))return new Response(`body参数${key}必填`, { status: 400 });
                if(!validate.type)continue;

                if(["string", "number", "boolean"].includes(validate.type)){
                    if(typeof body[key] !== validate.type)return new Response(`body参数${key}类型错误`, { status: 400 });
                }else if(validate.type === "array"){
                    if(!Array.isArray(body[key]))return new Response(`body参数${key}类型错误`, { status: 400 });
                }

                if(["string", "array"].includes(validate.type)){
                    if(validate.maxLength && body[key].length > validate.maxLength)return new Response(`body参数${key}长度超过设定值：${validate.maxLength}`, { status: 400 });
                    if(validate.minLength && body[key].length < validate.minLength)return new Response(`body参数${key}长度不足设定值：${validate.minLength}`, { status: 400 });
                }

                if(validate.type === "number"){
                    if(validate.maxValue && body[key] > validate.maxValue)return new Response(`body参数${key}超过最大值：${validate.maxValue}`, { status: 400 });
                    if(validate.minValue && body[key] < validate.minValue)return new Response(`body参数${key}低于最小值：${validate.minValue}`, { status: 400 });
                }
                if(validate.custom && !(await validate.custom(body[key])))return new Response(`body参数${key}自定义校验失败`, { status: 400 });
                
            }
        }

        return originalMethod.apply(this, [req, payload]);
    }
    return descriptor as any;
}