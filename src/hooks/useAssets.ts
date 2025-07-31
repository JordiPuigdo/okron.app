import { Asset } from "@interfaces/Asset";
import { assetService } from "@services/assetService";
import useSWR from "swr";

const fetchAssets = async (): Promise<any[]> => {
  try {
    const assets = await assetService.getAll();

    const elements: any[] = [];

    const addAssetAndChildren = (asset: Asset) => {
      if (asset.createWorkOrder) {
        elements.push({
          id: asset.id,
          code: asset.code,
          description: asset.description,
          brand: asset.brand,
        });
      }

      if (asset.childs?.length) {
        asset.childs.forEach((childAsset) => {
          addAssetAndChildren(childAsset);
        });
      }
    };

    assets.forEach((asset) => {
      addAssetAndChildren(asset);
    });

    return elements;
  } catch (error) {
    console.error("Error al obtener activos:", error);
    return []; // Return an empty array in case of error
  }
};

export const useAssets = () => {
  const {
    data: assets,
    error: assetsError,
    mutate: fetchAllAssets,
  } = useSWR<any[]>("assets", fetchAssets, {
    revalidateOnFocus: false,
  });

  return { assets, assetsError, fetchAllAssets };
};
