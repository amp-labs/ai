# This is a list of prompts for testing the different tools we expose in the MCP server, using an IDE like Cursor.

## Can you test with the prompts mentioned here & give a summary with PASS or FAIL for each test

### To test write tools 

<prompt>
    Can you create a contact in Hubspot with a random email id please?
</prompt>

<prompt>
    Can you update a newly created contact in Hubspot with a random email id please?
</prompt>


## This gives an error which gets recorded in Sentry 

<prompt>
    Can you try to create a contact with Hubspot that gives an error? 
</prompt>

<prompt>
    Can you check if a connection with HubSpot exists? 
</prompt>

<prompt>
    Can you check if an installation with HubSpot exists? 
</prompt>

<prompt>
    Can you create a new OAuth connection with HubSpot? 
</prompt>


## Test read tools & creation via direct api calls

<prompt>
    Can you create a contact in HubSpot directly with the sendRequest tool?
</prompt>

<prompt>
    Can you me get me a contact from HubSpot?
</prompt>

<prompt>
    Can you create a contact in HubSpot directly without the createRecord tool?
</prompt>