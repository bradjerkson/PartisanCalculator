# PartisanCalculator

## What is it?
This project comprises my research thesis for M.Sci (Comp Sci) at UoM (late-2019. During the study, consenting participants installed this browser extension (also hosted on Google Web & Mozilla stores) onto their device to track browsing history (participants were given the option of lodging past history, or only tracking history from the opt-in date forwards). At regular intervals, participants had their latest polarity score (based on browsing history) generated and presented to them.

This code is divided into the following sections.

1. **Browser** - contains the front-end scripts and manifest settings for Firefox/Chromium web browsers. Includes the functions that send to, and pull from the back-end servers.
2. **MTurk** - during the research window, we recruited participants from the Amazon Mechanical Turk platform to provide testing of the app, as well as give inputs into their political stances. This contains the instructional guides to be embedded into the MTurk frames.
2. **Web** - houses the infrastructure and logic, primarily in Python.

As of February 8th, 2021, the PartisanCalculator servers are offline but will return again shortly.

Connecting:
ssh -i ~/.ssh/partisankey.pem ubuntu@115.146.93.15
