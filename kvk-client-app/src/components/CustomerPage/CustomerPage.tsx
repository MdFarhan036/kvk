import { ReactNode } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';

type CustomerPageProps = {
  children: ReactNode;
};

export default function CustomerPage({
  children,
}: CustomerPageProps) {
  return (
    <View style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <Header />

      {/* =================================================
          PAGE CONTENT + FOOTER
      ================================================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}

        {/* =================================================
            FOOTER
        ================================================= */}

        <Footer />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F7',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});