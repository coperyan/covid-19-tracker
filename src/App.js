import React, { useEffect, useState } from "react";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import "./App.css";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import numeral from "numeral";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  //Upon initialization of the app, grab ALL data
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  //API call to collect list of countries with COVID data
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data
            .map((country) => ({
              //Full country name
              name: country.country,
              //Abbreviation of country
              value: country.countryInfo.iso2,
            }))
            .filter((country) => country.value !== null);

          //Use sorted data function to sort data by case count
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  //Event handler when a new country is selected from the dropdown
  const onCountryChange = async (event) => {
    //Setting const of new value
    const countryCode = event.target.value;

    //Log selection of country
    console.log("New Country Selected >> ", countryCode);

    //Set the country code
    setCountry(countryCode);

    //Update Data, set URL to worldwide or country-specific
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        //Sets the countrycode
        setCountry(countryCode);

        //Sets all of the data from the API response
        setCountryInfo(data);

        //Set center of map based on country selection
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  //Logging returned data in console
  console.log("Country Info >>>", countryInfo);

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          {/* Title */}
          <h1>COVID-19 TRACKER</h1>
          {/* Dropdown for Country Selection */}
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              {/* Static Dropdown value for worldwide selection */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Mapping Countries from API call to Dropdown */}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          {/* Info Box for COVID Cases */}
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="COVID-19 Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />

          {/* Info Box for COVID Recoveries */}
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recoveries"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />

          {/* Info Box for COVID Deaths */}
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>

        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            {/* Table */}
            <Table countries={tableData} />
            <h3 className="app__graphTitle">Worldwide New {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
