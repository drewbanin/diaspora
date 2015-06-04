## Diaspora  - CS 485, Summer 2015

#### Hypothesis:
The human diaspora out of Africa can be modeled with cellular automata.

=================================

### Running the simulation
From the root of this repo, run:
  `python -m SimpleHTTPServer`
to start a webserver on port 8000

Then navigate to http://localhost:8000 to see it in action

### Development
Run `npm install` to download the required dependencies for the simulation

### Generating graphs
Make sure to open the browser console once the web page has been loaded. Diagnostic
information will be printed to the console which can then be used to make charts using
R.

To do this, save the console log output to the file `data/diaspora.csv`, then run
  `Rscript make_plots.R`

Happy exploring!
