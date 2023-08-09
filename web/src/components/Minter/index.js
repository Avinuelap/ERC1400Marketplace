// components/TokenForm.jsx
import React, { useState } from "react";
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

  const onValuesChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  const onFinish = () => {
    console.log("Form Data:", formData);
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
              marginTop: "15px",
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
