import validator from 'validator';
import { logger } from './logger.js';

export const validateEmail = (email) => {
    return validator.isEmail(email);
};

export const replaceTemplateVars = (template, vars) => {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value || '');
    }
    return result;
};

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = baseDelay * Math.pow(2, i);
            logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
            await sleep(delay);
        }
    }
};
