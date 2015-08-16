### node-fritzbox [![Build Status](https://travis-ci.org/franciscogouveia/node-fritzbox.svg?branch=master)](https://travis-ci.org/franciscogouveia/node-fritzbox)

Setup your Fritz!Box from the command line. Or just use it as an API in your node project.

#### Warning

Use this software at your own risk.

#### Setup

Setup the environment variables:

* FB_HOST (optional - default: fritz.box)
* FB_PASSWORD (optional - default: asks input)

Alternatively, you can create a `.env` file with this environment variables.

Then,

```
npm install
```

And you should be good to go.

#### Usage

At the moment it is only possible to read/set existent port-forwarding rules.

##### Listing rules

```
node index port-forwarding list
```

##### Enable rules

```
node index port-forwarding enable active_1 active_2 ...
```

##### Disable rules

```
node index port-forwarding disable active_1 active_2 ...
```

#### Tested devices

* Fritz!Box 7362 SL (Fritz!OS 06.20)

#### LICENCE

The MIT License (MIT)

Copyright (c) 2015 Francisco Alexandre de Gouveia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
