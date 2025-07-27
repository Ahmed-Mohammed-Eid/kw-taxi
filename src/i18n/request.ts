import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

import { fileNames } from '../../messages/files-names';

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    const messages = await Promise.all(fileNames.map(async (fileName) => {
        const content = await import(`../../messages/${locale}/${fileName}.json`);
        return { fileName, content };
    }));

    // Format: { [fileName]: content }
    const messagesObj = messages.reduce((acc, { fileName, content }) => {
        acc[fileName] = content;
        return acc;
    }, {} as Record<string, any>);

    return {
        locale,
        messages: messagesObj
    };
});
