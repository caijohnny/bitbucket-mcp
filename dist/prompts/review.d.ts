import { BitbucketClient } from '../bitbucket-client.js';
export declare function registerReviewPrompts(client: BitbucketClient): {
    review_my_prs: {
        name: string;
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
        handler: (args: {
            projectKey?: string;
            repoSlug?: string;
            prId?: number;
        }) => Promise<{
            messages: {
                role: "user";
                content: {
                    type: "text";
                    text: string;
                };
            }[];
        }>;
    };
};
