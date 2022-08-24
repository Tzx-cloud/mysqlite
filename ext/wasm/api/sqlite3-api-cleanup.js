/*
  2022-07-22

  The author disclaims copyright to this source code.  In place of a
  legal notice, here is a blessing:

  *   May you do good and not evil.
  *   May you find forgiveness for yourself and forgive others.
  *   May you share freely, never taking more than you give.

  ***********************************************************************

  This file is the tail end of the sqlite3-api.js constellation,
  intended to be appended after all other sqlite3-api-*.js files so
  that it can finalize any setup and clean up any global symbols
  temporarily used for setting up the API's various subsystems.
*/
'use strict';
if('undefined' !== typeof Module){ // presumably an Emscripten build
  /**
     Install a suitable default configuration for sqlite3ApiBootstrap().
  */
  const SABC = self.sqlite3ApiBootstrap.defaultConfig;
  SABC.Module = Module /* ==>  Currently needs to be exposed here for test code. NOT part
                          of the public API. */;
  SABC.exports = Module['asm'];
  SABC.memory = Module.wasmMemory /* gets set if built with -sIMPORT_MEMORY */;

  /**
     For current (2022-08-22) purposes, automatically call
     sqlite3ApiBootstrap().  That decision will be revisited at some
     point, as we really want client code to be able to call this to
     configure certain parts. Clients may modify
     self.sqlite3ApiBootstrap.defaultConfig to tweak the default
     configuration used by a no-args call to sqlite3ApiBootstrap().
  */
  //console.warn("self.sqlite3ApiConfig = ",self.sqlite3ApiConfig);
  const sqlite3 = self.sqlite3ApiBootstrap();
  delete self.sqlite3ApiBootstrap;

  if(self.location && +self.location.port > 1024){
    console.warn("Installing sqlite3 bits as global S for dev-testing purposes.");
    self.S = sqlite3;
  }

  /* Clean up temporary references to our APIs... */
  delete sqlite3.capi.util /* arguable, but these are (currently) internal-use APIs */;
  //console.warn("Module.sqlite3 =",Module.sqlite3);
  Module.sqlite3 = sqlite3 /* Currently needed by test code and sqlite3-worker1.js */;
}else{
  console.warn("This is not running in an Emscripten module context, so",
               "self.sqlite3ApiBootstrap() is _not_ being called due to lack",
               "of config info for the WASM environment.",
               "It must be called manually.");
}
