# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewEngagement, listEngagements, assignUserToEngagement, listResourceRequestsForUser } from '@dataconnect/generated';


// Operation CreateNewEngagement:  For variables, look at type CreateNewEngagementVars in ../index.d.ts
const { data } = await CreateNewEngagement(dataConnect, createNewEngagementVars);

// Operation ListEngagements: 
const { data } = await ListEngagements(dataConnect);

// Operation AssignUserToEngagement:  For variables, look at type AssignUserToEngagementVars in ../index.d.ts
const { data } = await AssignUserToEngagement(dataConnect, assignUserToEngagementVars);

// Operation ListResourceRequestsForUser:  For variables, look at type ListResourceRequestsForUserVars in ../index.d.ts
const { data } = await ListResourceRequestsForUser(dataConnect, listResourceRequestsForUserVars);


```