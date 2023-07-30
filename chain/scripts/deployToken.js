const ERC1400 = artifacts.require('ERC1400'); // Asegúrate de tener el nombre correcto del contrato

module.exports = async function (deployer) {
  await deployer.deploy(ERC1400, "MyToken", "MTK"); // Aquí puedes especificar los argumentos necesarios para el constructor de tu contrato
};
