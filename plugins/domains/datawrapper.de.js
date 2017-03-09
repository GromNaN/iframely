const request = require('request');

const getChart = (id) => new Promise((resolve, reject) => {
    request({
        uri: `https://www.datawrapper.de/api/charts/${id}`,
        method: 'GET',
        json: true,
    }, (err, res, body) => {
        if (err) {
            reject(err);
        } else if (!(body && (body.status === 'ok') && body.data && body.data.id && body.data.publicUrl)) {
            reject(new Error('The provider "datawrapper" does not provide valid data'))
        } else {
            resolve(body.data);
        }
    });
});

module.exports = {
    highestPriority: true,

    re: [
        /(?:https?:)?\/\/datawrapper\.dwcdn\.net\/([^/]+)/i
    ],

    provides: ['datawrapperChart'],

    getData: function (urlMatch, request, options, cb) {
        let datawrapperChartId = urlMatch[1];

        if (datawrapperChartId) {
            getChart(datawrapperChartId)
                .then((chart) => {
                    cb(null, { datawrapperChart: chart });
                })
                .catch(cb);
        } else {
            cb(null);
        }
    },

    getMeta: function(datawrapperChart) {
        return {
            site: 'Datawrapper',
            title: datawrapperChart.title || null,
            id: datawrapperChart.id,
            canonical: datawrapperChart.publicUrl,
            date: (new Date(datawrapperChart.publishedAt)).toISOString(),
        };
    },

    getLinks: function(datawrapperChart) {
        const links = [];

        links.push({
            type: CONFIG.T.text_html,
            rel: [CONFIG.R.player, CONFIG.R.html5, CONFIG.R.ssl, CONFIG.R.iframely],
            href: datawrapperChart.canonical,
            html: `<iframe src="https://datawrapper.dwcdn.net/${datawrapperChart.id}/1/" frameborder="0" allowtransparency="true" allowfullscreen="allowfullscreen" webkitallowfullscreen="webkitallowfullscreen" mozallowfullscreen="mozallowfullscreen" oallowfullscreen="oallowfullscreen" msallowfullscreen="msallowfullscreen" width="600" height="230"></iframe>`,
        });

        return links;
    },

    tests: [
        'https://datawrapper.dwcdn.net/Dw4m5/3/',
        'http://cf.datawrapper.de/oMtQK/2/'
    ]
};
