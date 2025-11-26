// @ts-nocheck
import React from "react";
import { Box } from "@adminjs/design-system";

const GardenImage = (props: any) => {
  const { record, property } = props;
  const url = record?.params?.[property.path];

  if (!url) return <Box>No image</Box>;

  return (
    <Box>
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          style={{
            maxWidth: "100%",
            maxHeight: 400,
            objectFit: "contain",
            borderRadius: 8,
          }}
        />
      </a>
    </Box>
  );
};

export default GardenImage;
