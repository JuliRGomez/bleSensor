
  var deviceName = 'Wheeler_Jump_30'
  var bleService = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  var bleCharacteristic = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  var bleCharacteristicTwo = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
  var bluetoothDeviceDetected
  var gattCharacteristic
  var gattCharacteristicTwo
  var inter;
  let respuesta;

  document.querySelector('#read').addEventListener('click', function() {
    if (isWebBluetoothEnabled()) { read() }
  })

  document.querySelector('#start').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { start() }
  })

  document.querySelector('#stop').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { stop() }
  })

  document.querySelector('#write').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { write() }
  })

  document.querySelector('#read-one').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) { readOne() }
  })

  function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!')
      return false
    }

    return true
  }

  function getDeviceInfo() {
    let options = {
      optionalServices: [bleService],
      filters: [{
         services: [bleService],
      }]
    }

    console.log('Requesting any Bluetooth Device...')
    return navigator.bluetooth.requestDevice(options).then(device => {
      bluetoothDeviceDetected = device
    }).catch(error => {
      console.log('Argh! ' + error)
    })
  }

  function read() {
    return (bluetoothDeviceDetected ? Promise.resolve() : getDeviceInfo())
    .then(connectGATT)
    .then(_ => {
      console.log('Reading UV Index...')
      return gattCharacteristic.readValue()
    })
    .catch(error => {
      console.log('Waiting to start reading: ' + error)
    })
  }

  function write(){
    const valueToWrite = Uint8Array.of(48,48,48,49)
    gattCharacteristic.writeValue(valueToWrite)
    .then(_ => {
        console.log('variable seteada.');
            inter=setInterval(readOne,500,"JavaScript");
            })
        .catch(error => { console.error(error); });
  }
  function readOne(){
    gattCharacteristic.readValue()
    .then(value=>{
        //console.log(value)
    })
  }

  function connectGATT() {
    if (bluetoothDeviceDetected.gatt.connected && gattCharacteristic) {
      return Promise.resolve()
    }

    return bluetoothDeviceDetected.gatt.connect()
    .then(server => {
      console.log('Getting GATT Service...')
      return server.getPrimaryService(bleService)
    })
    .then(service => {
      console.log('Getting GATT Characteristic...')
      //return service.getCharacteristic(bleCharacteristic)
      return Promise.all([
        service.getCharacteristic(bleCharacteristic)
        .then(characteristic => {
            gattCharacteristic = characteristic
            gattCharacteristic.addEventListener('characteristicvaluechanged',
                handleChangedValue)}),
        service.getCharacteristic(bleCharacteristicTwo)
          .then(characteristic=>{
              gattCharacteristicTwo=characteristic;
          }),
      ]);
    })
    .then(_=> {
      //gattCharacteristic = characteristic
      //gattCharacteristic.addEventListener('characteristicvaluechanged',
        // handleChangedValue)
      document.querySelector('#start').disabled = false
      document.querySelector('#stop').disabled = true
      alert("pulse escribir")
    })
  }

  function handleChangedValue(event) {
     // respuesta=event.target.value
     // console.log(event.target.value)
      console.log(event.target.value)

    let value = event.target.value.getUint8(0)
    let value2= event.target.value.getUint8(1)
    let value3= event.target.value.getUint8(2)
    let value4= event.target.value.getUint8(3)
    let value5= event.target.value.getUint8(4)
    let value6= event.target.value.getUint8(5)
    let value7= event.target.value.getUint8(6)
    let value8= event.target.value.getUint8(7)
    let indicator=(value2*256)+value;
    let tVuelo=(value4*256)+value3;
    let tPiso=(value6*256)+value5;
    if (indicator==1)
    {
        let altura= ((0.000981*(tVuelo*tVuelo))/8)+2;
    var now = new Date()
    console.log('> ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' Respuesta :' + indicator+','+tVuelo+','+tPiso)
    //alert("la altura es : "+altura)
    document.querySelector('#height').value= altura;
    clearInterval(inter);
    }
    
  }

  function start() {
    gattCharacteristic.startNotifications()
    .then(_ => {
      console.log('Start reading...')
      document.querySelector('#start').disabled = true
      document.querySelector('#stop').disabled = false
    })
    .catch(error => {
      console.log('[ERROR] Start: ' + error)
    })
  }

  function stop() {
    gattCharacteristic.stopNotifications()
    .then(_ => {
      console.log('Stop reading...')
      document.querySelector('#start').disabled = false
      document.querySelector('#stop').disabled = true
    })
    .catch(error => {
      console.log('[ERROR] Stop: ' + error)
    })
  }
