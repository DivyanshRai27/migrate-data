const getClients = (env) => {

  switch (env) {
    case 'qa':
      return '8d2bdec3-5e86-4a87-afcf-8ecde183ecf1';

    case 'qa2':
      return '732e7412-d4df-441f-8942-b257c2c0fe59';

    case 'beta':
      return '178fcdec-a5fd-49bb-a638-a1ccfd27e50a';
    
    case 'base':
      return '9d56440f-2caf-4b01-ab06-6290c44cd548';
  
    default:
      return '8d2bdec3-5e86-4a87-afcf-8ecde183ecf1';
  }
}

module.exports = {
  getClients
}