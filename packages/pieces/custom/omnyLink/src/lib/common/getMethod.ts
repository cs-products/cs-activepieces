import { HttpMethod } from "@activepieces/pieces-common"

export const getMethod = (method: string) => {
    const inLowerCase = method.toLowerCase()
    if (inLowerCase === 'post') {
        return HttpMethod.POST
    } else if (inLowerCase === 'get') {
        return HttpMethod.GET
    } else if (inLowerCase === 'patch') {
        return HttpMethod.PATCH
    } else if (inLowerCase === 'put') {
        return HttpMethod.PUT
    } else if (inLowerCase === 'delete') {
        return HttpMethod.DELETE
    } else if (inLowerCase === 'head') {
        return HttpMethod.HEAD
    } else {
        return ''
    }
}