import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const LinksViewer = ({ links, compact = false }) => {
  if (!links || links.length === 0) {
    return null;
  }

  const openLink = (url) => {
    let formattedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = `https://${url}`;
    }
    Linking.openURL(formattedUrl);
  };

  const getDomain = (url) => {
    try {
      let formattedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        formattedUrl = `https://${url}`;
      }
      return new URL(formattedUrl).hostname;
    } catch {
      return url;
    }
  };

  const getLinkIcon = (url) => {
    const domain = getDomain(url).toLowerCase();

    if (domain.includes("youtube") || domain.includes("youtu.be"))
      return "logo-youtube";
    if (domain.includes("github")) return "logo-github";
    if (domain.includes("google")) return "logo-google";
    if (domain.includes("facebook")) return "logo-facebook";
    if (domain.includes("twitter") || domain.includes("x.com"))
      return "logo-twitter";
    if (domain.includes("instagram")) return "logo-instagram";
    if (domain.includes("linkedin")) return "logo-linkedin";
    if (domain.includes("drive.google")) return "cloud";
    if (domain.includes("docs.google")) return "document-text";
    if (domain.includes("slides.google")) return "easel";
    if (domain.includes("sheets.google")) return "grid";

    return "link";
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.compactLinkItem}
            onPress={() => openLink(link)}
            activeOpacity={0.7}
          >
            <View style={styles.compactLinkContent}>
              <Ionicons name={getLinkIcon(link)} size={18} color="#4285F4" />
              <Text style={styles.compactLinkText} numberOfLines={1}>
                {getDomain(link)}
              </Text>
            </View>
            <Ionicons name="open-outline" size={14} color="#4285F4" />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {links.map((link, index) => (
        <TouchableOpacity
          key={index}
          style={styles.linkItem}
          onPress={() => openLink(link)}
          activeOpacity={0.7}
        >
          <View style={styles.linkContent}>
            <Ionicons name={getLinkIcon(link)} size={20} color="#4285F4" />
            <View style={styles.linkDetails}>
              <Text style={styles.linkText} numberOfLines={1}>
                {link}
              </Text>
              <Text style={styles.linkDomain}>{getDomain(link)}</Text>
            </View>
          </View>

          <Ionicons name="open-outline" size={16} color="#4285F4" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  compactContainer: {
    marginVertical: 4,
  },
  compactLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#4285F4",
  },
  compactLinkContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  compactLinkText: {
    fontSize: 13,
    color: "#4285F4",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactText: {
    fontSize: 12,
    color: "#4285F4",
    marginLeft: 4,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  linkDetails: {
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    color: "#4285F4",
    fontWeight: "500",
  },
  linkDomain: {
    fontSize: 12,
    color: "#1976D2",
    marginTop: 2,
  },
});

export default LinksViewer;
