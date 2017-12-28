/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// // Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
// var bot = new builder.UniversalBot(connector, function (session) {
//     session.send("You said: %s", session.message.text);
// });

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
// var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
// bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

// const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

const LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/274d51cc-2037-44a8-91ee-87a829b1b2c6?subscription-key=91798b1a1cde4776bcc9a55893f1e4da&verbose=true&timezoneOffset=0&q='

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);
// var intents = new builder.IntentDialog({ recognizers: [recognizer] })
// .matches('MyAllowances', (session) => {
//     session.send('You reached MyAllowances intent, you said \'%s\'.', session);
// })
// .matches('AllowanceSpecific', (session) => {
//     session.send('You reached AllowanceSpecific intent, you said \'%s\'.', session.message.text);
// })
// .matches('AllowanceList', (session) => {
//     session.send('You reached AllowanceList intent, you said \'%s\'.', session.message.text);
// })
// .matches('AllowanceDetails', (session) => {
//     session.send('You reached AllowanceDetails intent, you said \'%s\'.', session.message.text);
// })
// /*
// .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
// */
// .onDefault((session) => {
//     session.send('Sorry, I did not understand \'%s\'.', session.message.text);
// });

// bot.dialog('/', intents);    

bot.dialog('AllowanceListDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        session.send('You reached AllowanceListDialog intent, you said \'%s\'.', session.message.text);

        var msg = new builder.Message(session).addAttachment(createPolicyListCard(session));
        session.send(msg);

        session.send('Please select one of the allowances to get more details');

        session.endDialog();
    }
).triggerAction({
    matches: 'AllowanceList'
});


function createPolicyListCard(session) {
    return new builder.HeroCard(session)
        .title('Adnoc allowances')
        .subtitle('Topics')
        .text('Please select one you are interested in, it will take to intranet portal relevant page.')
        .buttons([
            builder.CardAction.openUrl(session, 'https://google.com', 'General Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Social Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Child Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Furniture Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Remote Area Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Shift Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Transportation Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Telephone Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Duty Travel Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Air travel Allowance'),
            builder.CardAction.openUrl(session, 'https://google.com', 'Housing Allowance')
        ]);
}

bot.dialog('AllowanceSpecificDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        session.send('You reached AllowanceSpecificDialog intent, you said \'%s\'.', session.message.text);
        var nationality = builder.EntityRecognizer.findEntity(intent.entities, 'Nationality');
        var grade = builder.EntityRecognizer.findEntity(intent.entities, 'Grade');
        var allowanceType = builder.EntityRecognizer.findEntity(intent.entities, 'AllowanceType');

        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([

            new builder.HeroCard(session)
                .title("Allowance Specific Dialog")
                .subtitle("Allowance type: %s", allowanceType.entity )
                .text("For nationality: %s \r\r grade: %s",nationality.entity, grade.entity )

            ]);
            
        session.send(msg); 
        // // Turn on a specific device if a device entity is detected by LUIS
        // if (allowanceType) {
        //     session.send('Ok, you are interested in allowance: %s', allowanceType.entity);
        //     session.send(' for nationality: %s', nationality.entity);
        //     session.send( ' and grade: %s', grade.entity);
        //     // Put your code here for calling the IoT web service that turns on a device
        // } else {
        //     // Assuming turning on lights is the default
        //     session.send('Can you please specify which of allowances are you interested in');
        //     // Put your code here for calling the IoT web service that turns on a device
        // }
        session.endDialog();
    }
).triggerAction({
    matches: 'AllowanceSpecific'
});

