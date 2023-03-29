import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import Card from "@/components/CardDeck";
import useRoom from "@/hooks/useRoom";
import { Avatar, Button, Form, Input, List, Modal, Typography } from "antd";
import Layout from "@/layouts/Layout";
import { useState } from "react";

const Home: NextPage = () => {
  const { rooms, createRoom, deleteRoom } = useRoom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onFinish = async () => {
    try {
      await createRoom(form.getFieldValue("room_name"));
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        title="Create Room"
        open={isModalOpen}
        onOk={form.submit}
        onCancel={handleCancel}
      >
        <Form form={form} onFinish={onFinish} requiredMark layout="vertical">
          <Form.Item
            name={"room_name"}
            rules={[{ required: true }]}
            label="Room Name"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Layout>
        <div className="tw-flex tw-justify-between">
          <Typography.Title level={3}>Poker Online</Typography.Title>
          <div>
            <Button onClick={showModal} type="primary">
              Create Room
            </Button>
          </div>
        </div>
        <List
          itemLayout="horizontal"
          className="tw-w-full"
          header={<div>Room list {rooms.length}</div>}
          dataSource={rooms}
          bordered
          renderItem={(item, index) => (
            <List.Item
              key={index}
              actions={[
                item.owner.id === session?.user.id ? (
                  <Button
                    onClick={() => deleteRoom(item.id)}
                    type="primary"
                    danger
                  >
                    Delete
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: "#1890ff" }} src={item.owner.avatar} />}
                title={<Link href={`/room/${item.id}`}>{item.name}</Link>}
                description={
                  <div className="tw-whitespace-nowrap">
                    {item.players.length} players
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Layout>
    </>
  );
};

export default Home;
