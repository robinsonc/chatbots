    var attachments = {
        "type": "message",
        "text": "If you have something in mind just type it in. Or pick from the below product categories",
        "suggestedActions": {
          "actions": [
            {
              "type": "imBack",
              "value": "Show me T-shirts",
              "title": "T-shirts"
            },
            {
              "type": "imBack",
              "value": "Show me Jeans",
              "title": "Jeans"
            },
            {
              "type": "imBack",
              "value": "Show me Shoes",
              "title": "Shoes"
            },
            {
              "type": "imBack",
              "value": "Show me Flats",
              "title": "Flats"
            },{
              "type": "imBack",
              "value": "Show me Bedsheets",
              "title": "Bedsheets"
            }
          ]
        }
      };
module.exports.greeting = attachments;
