# based on https://github.com/cambecc/earth
mkdir -p tmpdata
mkdir -p data
cd tmpdata

# lakes
if [ ! -f ne_50m_lakes.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/physical/ne_50m_lakes.zip" -o ne_50m_lakes.zip
fi
unzip -o ne_50m_lakes.zip

# rivers
if [ ! -f ne_50m_rivers_lake_centerlines_scale_rank.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/physical/ne_50m_rivers_lake_centerlines_scale_rank.zip" -o ne_50m_rivers_lake_centerlines_scale_rank.zip
fi
unzip -o ne_50m_rivers_lake_centerlines_scale_rank.zip


# countries
if [ ! -f ne_50m_admin_0_countries.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip" -o ne_50m_admin_0_countries.zip
fi
unzip -o ne_50m_admin_0_countries.zip

topojson -o ../data/vectors-high.json -- countries=ne_50m_admin_0_countries.shp
topojson --simplify-proportion 0.5 -o ../data/vectors-medium.json -- countries=ne_50m_admin_0_countries.shp
topojson --simplify-proportion 0.1 -o ../data/vectors-low.json -- countries=ne_50m_admin_0_countries.shp
