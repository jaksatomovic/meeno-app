import { Link2 } from "lucide-react";

import { useAppStore } from "@/stores/appStore";
import source_default_img from "@/assets/images/source_default.png";
import source_default_dark_img from "@/assets/images/source_default_dark.png";
import { useConnectStore } from "@/stores/connectStore";
import { useThemeStore } from "@/stores/themeStore";
import FontIcon from "../Common/Icons/FontIcon";

interface Account {
  email: string;
  lastSync: string;
}

interface DataSourceItemProps {
  name: string;
  icon?: string;
  connector: any;
  accounts?: Account[];
}

export function DataSourceItem({ name, icon, connector }: DataSourceItemProps) {
  // const isConnected = true;

  const isDark = useThemeStore((state) => state.isDark);

  const connector_data = useConnectStore((state) => state.connector_data);
  const endpoint_http = useAppStore((state) => state.endpoint_http);

  function findConnectorIcon() {
    const connector_id = connector?.id;

    // console.log("connector_id", connector_data, connector_id);

    const result_connector = connector_data[endpoint_http]?.find(
      (data: any) => data.id === connector_id
    );

    return result_connector;
  }

  function getTypeIcon() {
    const connectorSource = findConnectorIcon();
    const icons = connectorSource?.icon;

    if (!icons) {
      return isDark ? source_default_dark_img : source_default_img;
    }

    if (icons?.startsWith("http://") || icons?.startsWith("https://")) {
      return icons;
    } else {
      return endpoint_http + icons;
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon?.startsWith("font_") ? (
            <FontIcon name={icon} className="size-6" />
          ) : (
            <img src={getTypeIcon()} alt={name} className="size-6" />
          )}

          <span className="font-medium text-gray-900 dark:text-white">
            {name}
          </span>
        </div>
        <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1">
          <Link2 className="w-4 h-4" />
        </button>
      </div>
      {/* <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {isConnected ? "Manage" : "Connect Accounts"}
      </div> */}

      {/* {accounts.map((account, index) => (
        <div
          key={account.email}
          className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {account.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {index === 0 ? "My network disk" : `Network disk ${index + 1}`}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{account.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Recently Synced: {account.lastSync}
            </span>
            <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))} */}
    </div>
  );
}
