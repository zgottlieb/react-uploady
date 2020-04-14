<p align="center">
    <img src="https://res.cloudinary.com/yoav-cloud/image/upload/w_400/v22212321/icons/react-uploady-text-logo.png" width="300" alt='react-uploady Logo' aria-label='react-uploady' />
    
   <h3>Modern file-upload components & hooks for React.</h3>
</p>

<p align="center">

  [![CircleCI](https://circleci.com/gh/yoavniran/react-uploady.svg?style=svg)](https://circleci.com/gh/yoavniran/react-uploady)
  [![codecov](https://codecov.io/gh/yoavniran/react-uploady/branch/master/graph/badge.svg)](https://codecov.io/gh/yoavniran/react-uploady)
  [![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/brand@master/badge/badge-storybook.svg)](https://react-uploady-storybook.netlify.com/)
  [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
  [![license](https://img.shields.io/github/license/yoavniran/react-uploady?color=blue&style=plastic)](LICENSE.md)
</p>

## Intro

With React-Uploady you can build (client-side) file-upload features with just a few lines of code.

The philosophy behind this library is that it should be as simple as possible to use, yet customizable at every point. 

RU comes with many components and features. 
You get to choose which ones you need and only install the dependencies required (See [Packages](#packages) details below)

RU has a small footprint (by design):

| Bundle         | Minified size | GZipped size
| -------------- | ------------- | -------------
| core                         | 34.4KB          | 9.7KB
| core + ui                    | 44.6KB          | 11.8KB
| core + ui + chunked support  | 55.4KB          | 14.4KB
| everything                   | 62.7KB          | 15.7KB

## Documentation

Our __[Storybook](https://react-uploady-storybook.netlify.com/)__ has many examples, both simple and advanced.

<!--TODO XXXX Need animated gif here showing storybook XXXXX-->


Checkout our __[Guides](guides)__ section for additional examples & information.

## Installation

React-uploady is a mono-repo, and as such provides multiple packages with different functionality.

For React applications, at the very least, you will need the Uploady provider:

```bash

   yarn add @rpldy/uploady
``` 

Or

```bash

   npm i @rpldy/uploady
```

If you wish to use the uploading mechanism (no UI), at the very least, you will need the Uploader:

```bash

  yarn add @rpldy/uploader
```

Or

```bash

   npm i @rpldy/uploader
```


After that, you can add additional packages as needed. See below for more details.

## Packages

**Base Packages**

* [@rpldy/uploader](packages/uploader) - The processing and queuing engine
* [@rpldy/uploady](packages/ui/uploady) - The context provider for react-uploady and hooks (lots of hooks)

**UI Packages**
* [@rpldy/upload-button](packages/ui/upload-button) - Upload button component and asUploadButton HOC  
* [@rpldy/upload-preview](packages/ui/upload-preview) - Image preview component for files being uploaded 
* [@rpldy/upload-url-input](packages/ui/upload-url-input) - Input component to send URL as upload info (ex: [Cloudinary](https://cloudinary.com/documentation/upload_images#auto_fetching_remote_images))
* [@rpldy/upload-drop-zone](packages/ui/upload-drop-zone) - (Drag&)Drop zone to upload files and folder content
* @rpldy/crop - TDOO

**Uploaders**
* [@rpldy/chunked-uploady](packages/ui/chunked-uploady) - Wrapper for Uploady to support chunked uploads
* @rpldy/tus - TODO 

**Extra**
* [@rpldy/retry](packages/retry) - Add support for retrying failed uploads

**Shared Packages**

* [@rpldy/shared](packages/shared) - Internal set of utils+types that all packages require  
* [@rpldy/shared-ui](packages/ui/shared) - Internal set of utils+types that all UI packages require 
* [@rpldy/live-events](packages/life-events) - provides **cancellable** pub/sub "events" 


## Examples

For specific usage, see documentation in the relevant package README file.

For upload options see the [@rpldy/uploady docs](packages/ui/uploady).

### Simple Upload Button

This examples shows how you add Uploady and UploadButton to your app.
This is all it takes to get file uploading to work in your React app.

```javascript 

import React from "react";
import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <UploadButton/>
</Uploady>);

```

### Custom Upload Button

In case you want to use your own component as the upload trigger, use the asUploadButton HOC:

```javascript

import React from "react";
import Uploady from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";

const DivUploadButton = asUploadButton((props) => {
    return <div {...props} style={{ cursor: "pointer" }}>
        DIV Upload Button
    </div>
});

const App = () => (<Uploady
    destination={{ url: "https://my-server/upload" }}>
    <DivUploadButton/>
</Uploady>);

```

### Progress Hook




### Add support for Chunked Uploads





> See more (advanced) examples in our [guides](guides) and [storybook](https://react-uploady-storybook.netlify.com/).

## UMD Bundles

React-uploady is also available on CDNs such as [unpkg.com](https://unpkg.com) and [jsdelivr.com](https://www.jsdelivr.com/)

<!-- TOOD: add urls here -->

See this [guide](guides/UMD.md) for more information on how to use.

## Credits

logo's wing thanks to <a href="https://www.vecteezy.com/free-vector/illustration">Illustration Vectors by Vecteezy</a>