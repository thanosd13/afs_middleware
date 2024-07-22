const axios = require("axios");
const xml2js = require("xml2js");
const he = require("he"); // If you need to decode HTML entities
const { getHeaders } = require("./getAadeHeaders");

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const requestExpenses = async (id) => {
  try {
    const { username_aade, subscription_key_aade } = await getHeaders(id);

    // Calculate dateTo (current date) and dateFrom (30 days before)
    const currentDate = new Date();
    const dateTo = formatDate(currentDate);

    const pastDate = new Date();
    pastDate.setDate(currentDate.getDate() - 30);
    const dateFrom = formatDate(pastDate);

    // Construct the URL with the correct date strings
    const url = `${process.env.REQUEST_EXPENSES}?dateFrom=${dateFrom}&dateTo=${dateTo}`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/xml",
        "aade-user-id": username_aade,
        "ocp-apim-subscription-key": subscription_key_aade,
      },
    });

    const xml = response.data;

    // Decode HTML entities if necessary
    const decodedXml = he.decode(xml);

    // Parse the decoded XML
    return new Promise((resolve, reject) => {
      xml2js.parseString(
        decodedXml,
        { explicitArray: false, trim: true },
        (err, result) => {
          if (err) {
            console.error("Error parsing XML:", err);
            return resolve({ status: 500, error: "Error parsing XML" });
          } else {
            return resolve(result.string.RequestedBookInfo.bookInfo);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error:", error);
    return { status: 500, error: "Request failed" };
  }
};

module.exports = { requestExpenses };