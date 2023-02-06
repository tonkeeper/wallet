pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "devkit"

include(":sample")
include(":libs-core:ui")
include(":libs-ton:crypto")
include(":libs-ton:mnemonic")
include(":libs-feature:localauth")
include(":libs-feature:wallet")
