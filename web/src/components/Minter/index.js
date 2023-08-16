// components/TokenForm.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import SecurityTokenArtifact from "../../utils/SecurityToken.json";
import { Form, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./styles.module.css";

const Minter = () => {
  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    relatedAsset: "",
    documentationLink: "",
  });

  const deployContract = async () => {
    try {
      // Conectar con Metamask
      const provider = new ethers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // ABI y bytecode (importar o cargar desde algún lugar)
      const contractABI = SecurityTokenArtifact.abi;
      const contractBytecode = SecurityTokenArtifact.bytecode;

      // Crear una nueva instancia de contrato Factory
      const contractFactory = new ethers.ContractFactory(
        contractABI,
        contractBytecode,
        signer
      );

      // Desplegar el contrato con los valores del formulario
      const contract = await contractFactory.deploy(
        formData.tokenName,
        formData.tokenSymbol,
        formData.relatedAsset,
        formData.documentationName,
        formData.documentationLink
      );

      // Esperar a que se mine el contrato
      await contract.deployed();

      console.log("Contrato desplegado en:", contract.address);
    } catch (error) {
      console.error("Error desplegando el contrato:", error);
    }
  };

  const onValuesChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  const onFinish = () => {
    console.log("Form Data:", formData);
    deployContract();
  };

  return (
    <div className={styles.container}>
      <Form
        name="token_form"
        initialValues={formData}
        onValuesChange={onValuesChange}
        onFinish={onFinish}
        labelWrap
        layout="vertical"
        colon={false}
      >
        <Form.Item
          className={styles.formItem}
          label="Token name"
          name="tokenName"
          rules={[
            {
              required: true,
              message: "Please enter token name!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Token symbol"
          name="tokenSymbol"
          rules={[
            {
              required: true,
              message: "Please enter token symbol!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Related asset"
          name="relatedAsset"
          rules={[
            {
              required: true,
              message: "Please enter related asset!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Asset documentation name"
          name="documentationName"
          rules={[
            {
              required: true,
              message: "Please provide documentation name!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className={styles.formItem}
          label="Asset documentation URL"
          name="documentationLink"
          rules={[
            {
              required: true,
              message: "Please provide documentation URL!",
            },
            {
              type: "url",
              message: "Must be a valid URL!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item className={styles.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "10px",
            }}
            icon={<PlusOutlined />}
          >
            Create and list token
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Minter;
