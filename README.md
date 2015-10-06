### node-fritzbox [![Build Status](https://travis-ci.org/franciscogouveia/node-fritzbox.svg?branch=master)](https://travis-ci.org/franciscogouveia/node-fritzbox)

Setup your Fritz!Box from the command line. Or just use it as an API in your node project.

`Warning` Use this software at your own risk.

#### Running it in the command line

First of all, install it:

```
npm install node-fritzbox
```

Then, just use it. At the moment it is possible to:

* Obtain external IP address
* List devices (connected and disconnected)
* Get device info
* Send WOL packet to device
* List port-forwarding rules
* Enable / disable port-forwarding rules

##### Obtain external IP address

```
node-fritzbox online ip
```

Results in

```
Current online IP: XXX.XXX.XXX.XXX
```

##### List devices

```
node-fritzbox devices list
```

Results in

```
  [*] landevice3807 - Laptop (LAN 1 mit 1 Gbit/s) IP: 192.168.1.2 MAC: AA:AA:AA:AA:AA:AA
  [*] landevice3814 - Desktop (LAN 1 mit 1 Gbit/s) IP: 192.168.1.3 MAC: BB:BB:BB:BB:BB:BB
  [*] landevice3802 - Mobile-Phone-1 (WLAN) IP: 192.168.1.4 MAC: CC:CC:CC:CC:CC:CC
  [*] landevice3815 - Wireless-Speaker (WLAN) IP: 192.168.1.5 MAC: DD:DD:DD:DD:DD:DD
  [ ] landevice3806 - Other-Laptop
  [ ] landevice3818 - Mobile-Phone-2 (WLAN)
```

Where, in `[*] landeviceXXXX - Name (Connection) IP: ... MAC: ...`:

* `[*]` means active and `[ ]` means inactive/not connected
* `landeviceXXXX` is the device id
* `Name` is the device name (defined by the device)
* `Connection` is the connection information

##### Get device info

```
node-fritzbox devices info device_id
```

Results in

```
  Device: Laptop
  Static address: off
  Child security profile: filtprof1
  Auto Wake On LAN: off
```

##### Wake device

```
node-fritzbox devices wake device_id
```

Sends a WOL magic packet from the Fritz!Box to the device. If WOL is configured on the device, it should wake it up.

##### List port-forwarding rules

```
node-fritzbox port-forwarding list
```

Results in

```
  * active_1 - HTTP-Server (state: enabled)
  * active_2 - HTTPS-Server (state: disabled)
  * active_3 - SSH (state: enabled)
```

##### Enable port-forwarding rules

```
node-fritzbox port-forwarding enable active_1 active_2 ...
```

Enables the rules with the given ids.

##### Disable port-forwarding rules

```
node-fritzbox port-forwarding disable active_1 active_2 ...
```

Disables the rules with the given ids.


#### Setup

You can set up environment variables to change the address of Fritz!Box (in case you are not using the defaults). Optionally, you can also define the password, so that you don't have to type it all the time.

The configurable environment variables are:

* `FB_HOST` (optional - default: fritz.box)
* `FB_PASSWORD` (optional and **not recommended** - default: asks input)

And you should be good to go.


#### Tested devices

* Fritz!Box 7362 SL (Fritz!OS 06.30)

----

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
