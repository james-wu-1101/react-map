import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { Station } from '../types';
import { fetchYouBikeStations } from '../services/youbikeApi';
import SearchBox from './SearchBox';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// 修復 Leaflet 圖標問題
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// 地圖移動控制組件
const MapController: React.FC<{ 
  station: Station | null;
  userLocation: UserLocation | null;
  onStationSelect: (station: Station) => void;
}> = ({ station, userLocation, onStationSelect }) => {
  const map = useMap();

  useEffect(() => {
    if (station && isValidLatLng(station.latitude, station.longitude)) {
      map.setView([station.latitude, station.longitude], 18);
      onStationSelect(station);
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 16);
    }
  }, [station, userLocation, map, onStationSelect]);

  return null;
};

// 驗證經緯度是否有效
const isValidLatLng = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

interface UserLocation {
  latitude: number;
  longitude: number;
}

const Map: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  const mapRef = useRef<L.Map>(null);

  // 計算兩點之間的距離（公里）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球半徑（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 獲取用戶位置
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // 計算附近站點
          const nearby = stations
            .map(station => ({
              ...station,
              distance: calculateDistance(latitude, longitude, station.latitude, station.longitude)
            }))
            .filter(station => station.distance <= 3)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setNearbyStations(nearby);
          
          // 移動地圖到用戶位置
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 16);
          }
        },
        (error) => {
          console.error('獲取位置失敗:', error);
          alert('無法獲取您的位置，請確保已開啟位置權限。');
        }
      );
    } else {
      alert('您的瀏覽器不支持地理定位功能。');
    }
  };

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchYouBikeStations();
        // 驗證並過濾無效的站點數據
        const validStations = data.filter((station: Station) => 
          isValidLatLng(station.latitude, station.longitude)
        );

        if (validStations.length === 0) {
          throw new Error('沒有有效的站點數據');
        }

        console.log('有效站點數量:', validStations.length);
        console.log('第一個站點數據示例:', validStations[0]);
        
        setStations(validStations);
      } catch (err) {
        console.error('獲取站點數據時出錯:', err);
      }
    };

    loadStations();
    const interval = setInterval(loadStations, 60000); // 每分鐘更新一次
    return () => clearInterval(interval);
  }, []);

  const handleSelectStation = (station: Station) => {
    if (isValidLatLng(station.latitude, station.longitude)) {
      setSelectedStation(station);
      // 延遲一下再打開彈出視窗，確保地圖已經移動到位
      setTimeout(() => {
        const marker = markerRefs.current[station.sno];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
    } else {
      console.error('無效的站點位置:', station);
    }
  };

  const handleMarkerClick = (station: Station) => {
    setSelectedStation(station);
  };

  // 切換選單顯示狀態
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 點擊站點時關閉選單
  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    if (mapRef.current) {
      mapRef.current.setView([station.latitude, station.longitude], 18);
      setTimeout(() => {
        const marker = markerRefs.current[station.sno];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
    }
    // 在手機版上點擊站點後關閉選單
    if (window.innerWidth <= 768) {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="map-page">
      <div className="map-container">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="切換選單">
          <svg viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <div className="search-container">
          <SearchBox stations={stations} onSelectStation={handleSelectStation} />
        </div>
        <div className={`station-list ${isMenuOpen ? 'active' : ''}`}>
          <div className="station-list-header">
            <h3>附近站點</h3>
            <div className="station-list-actions">
              <button 
                className="location-button"
                onClick={getUserLocation}
              >
                顯示附近站點
              </button>
            </div>
          </div>
          <div className="station-list-content">
            {nearbyStations.length > 0 ? (
              nearbyStations.map((station) => (
                <div
                  key={station.sno}
                  className={`station-item ${selectedStation?.sno === station.sno ? 'active' : ''}`}
                  onClick={() => handleStationClick(station)}
                >
                  <h4>{station.sna}</h4>
                  <div className="station-info">
                    <p>可用車輛: {station.available_rent_bikes}</p>
                    <p>可用空位: {station.available_return_bikes}</p>
                    <p>車輛總數: {station.total}</p>
                    <p>距離: {station.distance?.toFixed(1)} 公里</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-stations">
                {userLocation ? '附近 3 公里內沒有站點' : '點擊按鈕顯示附近站點'}
              </div>
            )}
          </div>
        </div>
        <MapContainer
          center={[25.0330, 121.5654]} // 預設台北市中心
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController 
            station={selectedStation}
            userLocation={userLocation}
            onStationSelect={handleSelectStation}
          />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={30}
            spiderfyOnMaxZoom
            zoomToBoundsOnClick
            disableClusteringAtZoom={16}
            spiderLegPolylineOptions={{
              weight: 1.5,
              color: '#666',
              opacity: 0.8
            }}
            showCoverageOnHover={false}
            removeOutsideVisibleBounds
            chunkInterval={200}
            chunkDelay={50}
          >
            {stations.map((station) => {
              if (!isValidLatLng(station.latitude, station.longitude)) {
                console.warn('跳過無效站點:', station);
                return null;
              }
              return (
                <Marker
                  key={station.sno}
                  position={[station.latitude, station.longitude]}
                  eventHandlers={{
                    click: () => handleMarkerClick(station),
                  }}
                  ref={(marker) => {
                    markerRefs.current[station.sno] = marker;
                  }}
                  zIndexOffset={selectedStation?.sno === station.sno ? 1000 : 0}
                >
                  <Popup
                    closeButton={true}
                    autoClose={false}
                    closeOnEscapeKey={true}
                  >
                    <div className="station-popup">
                      <h3>{station.sna}</h3>
                      <p>地址：{station.ar}</p>
                      <p>可借車輛：{station.available_rent_bikes}</p>
                      <p>可還空位：{station.available_return_bikes}</p>
                      <p>總停車格：{station.total}</p>
                      <p>更新時間：{station.updateTime}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default Map; 