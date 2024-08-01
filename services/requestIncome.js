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

const requestIncome = async (id) => {
  try {
    const { username_aade, subscription_key_aade } = await getHeaders(id);

    // Calculate dateTo (current date)
    const currentDate = new Date();
    const dateTo = formatDate(currentDate);

    // Calculate dateFrom (first day of the same month, one year before)
    const pastDate = new Date(
      currentDate.getFullYear() - 1,
      currentDate.getMonth() - 6,
      1
    );
    const dateFrom = formatDate(pastDate);
    console.log("dateFrom:", dateFrom);
    console.log("dateTo:", dateTo);
    // Construct the URL with the correct date strings
    const url = `${process.env.REQUEST_INCOME}?dateFrom=${dateFrom}&dateTo=${dateTo}`;

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

const requestIncomeWithDates = async (id, dateFrom, dateTo) => {
  try {
    const { username_aade, subscription_key_aade } = await getHeaders(id);

    // // Format the dates
    // const formattedDateFrom = formatDate(new Date(dateFrom));
    // const formattedDateTo = formatDate(new Date(dateTo));

    // Construct the URL with the correct date strings
    const url = `${process.env.REQUEST_INCOME}?dateFrom=${dateFrom}&dateTo=${dateTo}`;

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

module.exports = { requestIncome, requestIncomeWithDates };
